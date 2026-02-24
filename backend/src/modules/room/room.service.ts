import { prisma } from "../../config/prisma";

export const createRoom = async({name , ownerId}:{name:string, ownerId:string})=>{
    return prisma.room.create({
        data:{
            name,
            ownerId
        }
    })
}    