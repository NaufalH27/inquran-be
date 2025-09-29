export class ResponseUserDto {
  id: number;
  username: string | null;
  fullName: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  photoUrl: string | null;
  googleId: string | null;
  googleEmail: string | null;

  constructor(user: {
    id: number;
    username: string | null;
    full_name: string | null;
    email: string | null;
    created_at: Date;
    updated_at: Date;
    photo_url?: string | null;
    google_id?: string | null; 
    google_email?: string | null;
  }) {
    this.id = user.id;
    this.username = user.username;
    this.fullName = user.full_name;
    this.email = user.email;
    this.createdAt = user.created_at;
    this.updatedAt = user.updated_at;
    this.googleId = user.google_id ?? null;
    this.googleEmail = user.google_email ?? null;

    this.photoUrl = user.photo_url ?? null;
  }
}
