import { Controller, Get, Headers, Param, Query } from "@progresive/common";

@Controller()
class AppController {
  @Get(":id")
  async test(
    @Param("id") id: string,
    @Query("test") test: string,
    @Headers() head: any
  ) {
    return {
      status: "ok!",
      id,
      test,
      head,
    };
  }
}

export default AppController;
