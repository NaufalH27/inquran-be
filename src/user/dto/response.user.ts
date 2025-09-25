import { Exclude, Expose } from 'class-transformer';

export class ResponseUserDto {
  id: number;
  username: string;
  fullName: string | null;
  email: string;
  created_at: Date;
  updated_at: Date;

  @Exclude()
  password: string;

  @Exclude()
  photo?: string; 

  constructor(partial: Partial<ResponseUserDto>) {
    Object.assign(this, partial);
  }

  @Expose({ name: 'photo_url' })
  get photoUrl(): string | null {
    if (!this.photo) return null;
    return `${process.env.UPLOAD_DIR}/${this.photo}`;
  }
}