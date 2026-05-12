import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BonusOperTypeEntity } from 'src/infrastructure/account/entity/bonus-oper-type.entity';
import { BonusOperEntity } from 'src/infrastructure/account/entity/bonus-oper.entity';
import { CardRepository } from 'src/infrastructure/account/repository/card.repository';
import { Repository } from 'typeorm';
import { CreateBonusOperDto } from './dto/create-bonus-oper.dto';
import { Card } from 'src/domain/account/card/model/card';
import { SignOperType } from './enum/sign-oper-type.enum';

@Injectable()
export class CreateCardBonusOperUseCase {
  constructor(
    @InjectRepository(BonusOperTypeEntity)
    private readonly operTypeRepo: Repository<BonusOperTypeEntity>,
    @InjectRepository(BonusOperEntity)
    private readonly operRepo: Repository<BonusOperEntity>,
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(input: CreateBonusOperDto, card: Card): Promise<BonusOperEntity> {
    const operType = await this.operTypeRepo.findOne({ where: { id: input.typeOperId } });
    if (!operType) {
      throw new NotFoundException(`Тип операции с id ${input.typeOperId} не найден`);
    }

    if (operType.signOper === SignOperType.DEDUCTION) {
      card.balance -= input.sum;
    } else {
      card.balance += input.sum;
    }

    await this.cardRepository.update(card);

    const operEntity = new BonusOperEntity();
    operEntity.cardId = card.cardId;
    operEntity.typeId = input.typeOperId;
    operEntity.operDate = input.operDate;
    operEntity.loadDate = new Date();
    operEntity.sum = input.sum;

    const saved = await this.operRepo.save(operEntity);
    return saved;
  }
}