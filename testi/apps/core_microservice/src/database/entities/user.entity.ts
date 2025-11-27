import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'uuid', unique: true})
  accountId: string

  @Column({ type: 'varchar', length: 20, default: 'User' })
  role: string;

  @Column({ type: 'boolean', default: false })
  disabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;


  @OneToMany(() => Profile, profile => profile.user)
  profiles: Profile[];
}
