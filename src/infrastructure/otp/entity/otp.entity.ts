import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'INDIAN_EMAIL_CODE', synchronize: false})
export class OtpEntity {
    @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
    id: number;

    @Column({name: 'EMAIL', type: 'varchar2' })
    email: string;

    @Column({ name: 'CONFIRM_CODE', type: 'varchar2' })
    otp: string;

    @Column({ name: 'CREATE_DATE', type: 'date' })
    createDate: Date;

    @Column({ name: 'EXPIRE_DATE', type: 'date' })
    expireDate: Date;
}