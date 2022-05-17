import { Body, Controller, Post } from "@nestjs/common";
import { WithoutAuthKey } from "../auth/decorators/without-auth-key.decorator";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonsService } from "./lessons.service";

@WithoutAuthKey()
@Controller("lessons")
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // @Post("create-one")
  // async create(@Body() createLessonDto: CreateLessonDto) {
  //   return this.lessonsService.create(createLessonDto);
  // }

  @Post("create-many")
  async createMany(@Body() createLessonsDto: CreateLessonDto[]) {
    console.log(createLessonsDto);
    return this.lessonsService.createMany(createLessonsDto);
  }
}
