const Testimonials = require('../modules/testimonial/model'),
{
TESTIMONY_CREATED,
  TESTIMONY_CREATED_FAILED,
  TESTIMONY_UPDATED,
  TESTIMONY_UPDATED_FAILED,
  TESTIMONY_DELETED,
  TESTIMONY_DELETED_FAILED,
  TESTIMONIES_RETRIEVED,
  TESTIMONY_NOT_FOUND,
  TESTIMONY_RETRIEVED,
  TESTIMONY_RETRIEVED_FAILED,
  INTERNAL_SERVER_ERROR
 } = require('../utils/http.response.message'),
 ApiResponse = require('../utils/http.response'),
 {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_CREATED,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_CONFLICT
 } = require('../utils/http.response.code');

class Testimonial extends Testimonials {
 

 static async createTestimony(data) {
  try {
   
   const testimony = await this.create(data);
   if (testimony) return ApiResponse.gen(HTTP_CREATED, TESTIMONY_CREATED, testimony);
   else throw ApiResponse.gen(HTTP_BAD_REQUEST, TESTIMONY_CREATED_FAILED);
  } catch (error) {
    logger.error(error);
    if(error.code == 11000) throw ApiResponse.gen(HTTP_CONFLICT, "Error: You have already given your testimony");
   if (error.code) throw error;
   else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, "Something went wrong", error);
  }
 }

 static async updateTestimony(id, data) {
  try {
   const testimony = await this.findByIdAndUpdate(id, {
    $set: data
   });
   if (testimony) return ApiResponse.gen(HTTP_OK, TESTIMONY_UPDATED, testimony);
   else throw ApiResponse.gen(HTTP_BAD_REQUEST, TESTIMONY_UPDATED_FAILED);
  } catch (error) {
   if (error.code) throw error;
   else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, "Something went wrong", error);
  }
 }

 static async deleteTestimony(id) {
  try {
   const testimony = await this.findByIdAndDelete(id);
   if (testimony) return ApiResponse.gen(HTTP_OK, TESTIMONY_DELETED);
   else throw ApiResponse.gen(HTTP_BAD_REQUEST, TESTIMONY_DELETED_FAILED);
  } catch (error) {
   if (error.code) throw error;
   else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, "Something went wrong", error);
  }
 }

 static async getTestimonials({
  limit,
  offset
 } = data) {
  try {

   let skip = parseInt(offset) || 0;

   skip = skip > 0 ? skip - 1 : 0;
   limit = parseInt(limit) || 10

   const testimonies = await this.find().limit(limit).skip(skip * limit)

   if (testimonies) return ApiResponse.gen(HTTP_OK, TESTIMONIES_RETRIEVED, testimonies)
   else throw ApiResponse(INTERNAL_SERVER_ERROR, TESTIMONY_RETRIEVED_FAILED)

  } catch (error) {
   if (error.code) throw error;
   else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, TESTIMONY_RETRIEVED_FAILED)
  }
 }

 static async getSingleTestimony(id){
  try {
   const testimony = await this.findById(id);
   if(testimony) return ApiResponse.gen(HTTP_OK, TESTIMONY_RETRIEVED, testimony)
   else throw ApiResponse.gen(HTTP_NOT_FOUND, TESTIMONY_NOT_FOUND)
  }catch (error){
   if(error.code) throw error
   else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, TESTIMONY_RETRIEVED_FAILED)
  }
 }

 static async deleteByOwner(id) {
  try {
    const testimonial = await this.deleteMany({
      createdBy: id
    });

    if (testimonial) {
      return {
        name: "Testimonial",
        ...testimonial
      };
    } else return {
      name: "Testimonial",
      acknowledged: false,
      deletedCount: 0
    };

  } catch (err) {
    logger.error(err);
    const msg = err.message;
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, msg);

  }

}
}

module.exports = Testimonial;