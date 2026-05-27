# Schema Contract Audit (Oracle -> Postgres)

This document captures the minimum schema contract required by current TypeORM entities and repositories.
The goal is runtime compatibility without business-logic rewrites.

## Covered entity contract

- `CRDCLIENT` <- `ClientEntity`
- `CRDCARD` <- `CardEntity`
- `CRDCARD_TYPE` <- `TariffEntity`
- `INDIAN_CLIENT_PSW` <- `PasswordEntity`
- `INDIAN_EMAIL_CODE` <- `OtpEntity`
- `INDIAN_SUBSCRIBE` <- `SubscribeEntity`
- `INDIAN_PACK_MIN` <- `PackEntity`
- `INDIAN_PACK_USAGE` <- `PackUsageEntity`
- `INDIAN_REMAINS_PACK` <- `RemainsPackEntity`
- `INDIAN_INVITED_CODE` <- `InvitedCodeEntity`
- `INDIAN_INVITED_CODE_USAGE` <- `InvitedCodeUsageEntity`

## Compatibility requirements

- Keep table and column names exactly as declared in entity decorators.
- Keep one-to-one constraints where entity graph expects unique relation.
- Keep `synchronize: false`; schema must be managed externally.
- Keep indexes for repository query paths (`where`, `join`, and `orderBy` fields).

## Required indexes and constraints

- `CRDCLIENT`
  - index on `CORRECT_PHONE`
  - index on `CLIENT_ID` (PK)
  - optional unique on `PHONE` / `EMAIL` only if current data satisfies it
  - `INS_DATE` must exist (`orderBy('INS_DATE', 'DESC')`)
- `CRDCARD`
  - index on `CLIENT_ID`
  - index on `DEV_NOMER`
  - index on `NOMER`
- `CRDCARD_TYPE`
  - PK on `CARD_TYPE_ID`
- `INDIAN_CLIENT_PSW`
  - unique on `CLIENT_ID` (one password per client in current model)
- `INDIAN_EMAIL_CODE`
  - index on `EMAIL`
  - index on `PHONE`
- `INDIAN_SUBSCRIBE`
  - unique on `CLIENT_ID` (one active row per client in model)
  - index/unique on `SUBSCRIBE_ID`
  - index on `DATE_DEBITING`
- `INDIAN_PACK_USAGE`
  - unique on `CLIENT_ID` (current entity relation is one-to-one)
  - index on `(CLIENT_ID, DATE_USAGE)`
- `INDIAN_REMAINS_PACK`
  - unique on `CLIENT_ID`
- `INDIAN_INVITED_CODE`
  - unique on `CLIENT_ID`
  - unique on `INVITED_CODE`
- `INDIAN_INVITED_CODE_USAGE`
  - index on `INVITED_CODE_ID`
  - index on `USER_ID`

## Source files checked

- `src/infrastructure/database/database.module.ts`
- `src/infrastructure/account/entity/client.entity.ts`
- `src/infrastructure/account/entity/card.entity.ts`
- `src/infrastructure/account/entity/tariff.entity.ts`
- `src/infrastructure/account/entity/password.entity.ts`
- `src/infrastructure/otp/entity/otp.entity.ts`
- `src/infrastructure/subscribe/entity/subscribe.entity.ts`
- `src/infrastructure/pack/pack/entity/pack.entity.ts`
- `src/infrastructure/pack/pack/entity/pack-usage.entity.ts`
- `src/infrastructure/pack/remains/entity/remains-pack.entity.ts`
- `src/infrastructure/account/entity/invitedCode.entity.ts`
- `src/infrastructure/account/entity/invitedCodeUsage.entity.ts`

