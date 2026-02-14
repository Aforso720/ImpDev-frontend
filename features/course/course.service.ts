import { axiosWithAuth } from "@/lib/api/interceptors"
import { ICourse } from "@/lib/types"

export interface IRespCoures {
    items:ICourse[],
    total:number,
    page:number,
    limit:number
} 

export const CourseService = {
    async getAllPublCourse(page:number = 1 , limit:number = 20): Promise<IRespCoures>{
        const response = await axiosWithAuth.get<IRespCoures>(`/course?page=${page}&limit=${limit}&q=js&scope=PUBLIC`)
        return response.data
    } 
}