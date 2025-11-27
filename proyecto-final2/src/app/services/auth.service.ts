import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private USERS_KEY = 'mf_users_v1';
  private CURRENT_USER_KEY = 'mf_current_user_v1';
  private RESET_TOKENS_KEY = 'mf_password_reset_tokens_v1';

  constructor() {
    this.initializeAdminUser();
    // Nota: La limpieza inicial fue comentada porque estaba borrando usuarios registrados
    // Si deseas hacer una limpieza, comenta la línea siguiente y llama a purgeNonAdminData() manualmente
    // try {
    //   const cleaned = localStorage.getItem('mf_initial_cleanup_done');
    //   if (!cleaned) {
    //     this.purgeNonAdminData();
    //     localStorage.setItem('mf_initial_cleanup_done', '1');
    //   }
    // } catch (e) {
    //   console.warn('Could not perform initial cleanup:', e);
    // }
  }

  /**
   * Remove all non-admin users and clear all requests stored in localStorage.
   * This helps reset the app state while preserving admin accounts.
   */
  purgeNonAdminData() {
    try {
      const users = this.getAllUsers();
      const admins = users.filter(u => u.rol === 'admin');
      localStorage.setItem(this.USERS_KEY, JSON.stringify(admins));
      // Remove current user if it's not an admin
      const current = this.getCurrentUser();
      if (current && current.rol !== 'admin') {
        localStorage.removeItem(this.CURRENT_USER_KEY);
      }
      // Clear requests store (delegate to request key used elsewhere)
      try {
        localStorage.removeItem('mf_requests_v1');
      } catch (e) {
        // ignore
      }
      console.info('Initial cleanup: removed non-admin users and cleared requests');
      return true;
    } catch (err) {
      console.error('Error during purgeNonAdminData', err);
      return false;
    }
  }

  /**
   * Create a password reset token for the given email and persist it with expiry (1h).
   */
  createPasswordResetToken(email: string): string | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    if (!user) return null;
    const token = `prt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour
    const tokens = JSON.parse(localStorage.getItem(this.RESET_TOKENS_KEY) || '[]');
    tokens.push({ token, email, expires });
    localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify(tokens));
    return token;
  }

  /**
   * Reset password using token. Returns true on success.
   */
  resetPasswordWithToken(token: string, newPassword: string): boolean {
    const raw = localStorage.getItem(this.RESET_TOKENS_KEY) || '[]';
    const tokens = JSON.parse(raw) as Array<{ token: string; email: string; expires: number }>;
    const idx = tokens.findIndex(t => t.token === token);
    if (idx === -1) return false;
    const record = tokens[idx];
    if (Date.now() > record.expires) {
      // token expired, remove
      tokens.splice(idx, 1);
      localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify(tokens));
      return false;
    }
    // find user
    const users = this.getAllUsers();
    const uidx = users.findIndex(u => u.email === record.email);
    if (uidx === -1) return false;
    users[uidx].password = this.hashPassword(newPassword);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    // remove token
    tokens.splice(idx, 1);
    localStorage.setItem(this.RESET_TOKENS_KEY, JSON.stringify(tokens));
    // update current user if matches
    const current = this.getCurrentUser();
    if (current && current.email === users[uidx].email) {
      current.password = users[uidx].password;
      this.setCurrentUser(current);
    }
    return true;
  }

  /**
   * Validate password strength: at least 8 chars, one uppercase, one lowercase, one digit, one special char.
   */
  isStrongPassword(pwd: string): boolean {
    if (!pwd || pwd.length < 8) return false;
    const re = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;
    return re.test(pwd);
  }

  private initializeAdminUser() {
    const users = this.getAllUsers();
    const adminExists = users.some(u => u.rol === 'admin');
    if (!adminExists) {
      const admin: User = {
        id: 'admin-001',
        email: 'admin@mantenimiento.com',
        password: this.hashPassword('admin123'),
        nombre: 'Admin',
        apellido: 'Sistema',
        cedula: '0000000000',
        telefono: '3000000000',
        direccion: 'Central',
        edad: 30,
        rol: 'admin',
        createdAt: new Date().toISOString()
      };
      const users = this.getAllUsers();
      users.push(admin);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Ensure an additional admin user requested by the developer exists
    const extraAdminEmail = 'cajlpj@gmail.com';
    const extraAdminPwd = 'CRclass123@';
    const hasExtra = users.some(u => u.email === extraAdminEmail);
    if (!hasExtra) {
      const extraAdmin: User = {
        id: `admin-${Date.now()}`,
        email: extraAdminEmail,
        password: this.hashPassword(extraAdminPwd),
        nombre: 'Admin',
        apellido: 'Cuenta',
        cedula: '',
        telefono: '',
        direccion: '',
        rol: 'admin',
        createdAt: new Date().toISOString()
      } as User;
      const users2 = this.getAllUsers();
      users2.push(extraAdmin);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users2));
    }
  }

  /**
   * Attempt to authenticate against the local users store (fallback)
   */
  loginLocal(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado (local)' };
    }
    if (!user.password || !this.comparePassword(password, user.password)) {
      return { success: false, error: 'Contraseña incorrecta (local)' };
    }
    this.setCurrentUser(user);
    return { success: true, user };
  }

  private hashPassword(pwd: string): string {
    // Simple hash - en producción usar bcrypt
    return btoa(pwd);
  }

  private comparePassword(pwd: string, hash: string): boolean {
    return btoa(pwd) === hash;
  }

  getAllUsers(): User[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) as User[] : [];
  }

  getUserById(id: string): User | null {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) as User : null;
  }

  setCurrentUser(user: User) {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    if (!user.password || !this.comparePassword(password, user.password)) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    this.setCurrentUser(user);
    return { success: true, user };
  }

  register(user: Omit<User, 'id' | 'rol' | 'createdAt'>): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    if (users.some(u => u.email === user.email)) {
      return { success: false, error: 'Email ya registrado' };
    }
    if (users.some(u => u.cedula === user.cedula)) {
      return { success: false, error: 'Cédula ya registrada' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...user,
      password: user.password ? this.hashPassword(user.password) : undefined,
      rol: 'usuario',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  googleLogin(email: string, nombre: string, apellido: string): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        email,
        nombre,
        apellido,
        cedula: '',
        telefono: '',
        direccion: '',
        googleAuth: true,
        rol: 'usuario',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
    this.setCurrentUser(user);
    return { success: true, user };
  }

  /**
   * Ensure there is a local user record for the given email. If none exists,
   * create a minimal user and mark as current user.
   */
  ensureUserByEmail(email: string, nombre: string = '', apellido: string = ''): User {
    const users = this.getAllUsers();
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        email,
        nombre: nombre || '',
        apellido: apellido || '',
        cedula: '',
        telefono: '',
        direccion: '',
        rol: 'usuario',
        createdAt: new Date().toISOString()
      } as User;
      users.push(user);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
    this.setCurrentUser(user);
    return user;
  }

  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Set or update the password for a local user (hash stored).
   */
  setPassword(email: string, newPassword: string): boolean {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) return false;
    users[idx].password = this.hashPassword(newPassword);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    // If this is the current user, update current user store
    const current = this.getCurrentUser();
    if (current && current.email === email) {
      current.password = users[idx].password;
      this.setCurrentUser(current);
    }
    return true;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'admin';
  }
}
