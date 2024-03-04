import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {ClientEntity} from "./client.entity";

@Entity({ name: 'INDIAN_CLIENT_PSW', synchronize: false })
export class PasswordEntity {
    @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
    id: number;

    @OneToOne(() => ClientEntity, (client: ClientEntity) => client.password)
    @JoinColumn({ name: 'CLIENT_ID', referencedColumnName: 'clientId' })
    client: ClientEntity;

    @Column({ name: 'PASSWORD', type: 'varchar2' })
    password: string;
}
