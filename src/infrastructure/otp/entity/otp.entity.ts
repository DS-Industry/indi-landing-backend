import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'INDIAN_EMAIL_CODE', synchronize: false })
export class OtpEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'int' })
  id: number;

  @Column({ name: 'EMAIL', type: 'varchar' })
  email: string;

  @Column({ name: 'PHONE', type: 'varchar' })
  phone: string;

  @Column({ name: 'CONFIRM_CODE', type: 'varchar' })
  otp: string;

  @Column({ name: 'CREATE_DATE', type: 'timestamp', nullable: true })
  createDate: Date;

  @Column({ name: 'EXPIRE_DATE', type: 'timestamp', nullable: true })
  expireDate: Date;

  @Column({ name: 'REGISTRATION', type: 'int', nullable: true, default: 0 })
  registration: number;
}