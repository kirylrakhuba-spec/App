import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'uuid'})
  profileId: string

  @Column({name : 'image_url' ,type: 'varchar' })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  caption: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;


  @ManyToOne(() => Profile, profile => profile.posts)
  @JoinColumn({name: 'profileId'})
  profile: Profile;
}
