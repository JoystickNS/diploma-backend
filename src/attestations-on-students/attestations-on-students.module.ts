import { Module } from "@nestjs/common";
import { AttestationsOnStudentsService } from "./attestations-on-students.service";
import { AttestationsOnStudentsController } from "./attestations-on-students.controller";

@Module({
  controllers: [AttestationsOnStudentsController],
  providers: [AttestationsOnStudentsService],
})
export class AttestationsOnStudentsModule {}
