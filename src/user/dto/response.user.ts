import { Exclude } from 'class-transformer';

export class ResponseUserDto {
  id: number;
  username: string;
  fullName: string | null;
  email: string;
  created_at: Date;
  updated_at: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<ResponseUserDto>) {
    Object.assign(this, partial);
  }
}
