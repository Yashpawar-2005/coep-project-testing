import { prisma } from "../db/Connect.js"

export const get_rooms=async (req,res) => {
    try {
        const userid=req.userId;
        const created_room=await prisma.team.findMany({
            where:{
                adminid:userid
            }, 
            include: {
                _count: {
                  select: { members: true }, // Get the member count
                },
              },
        })
        const joined_room=await prisma.team.findMany({
            where: {
                members: {
                    some: {
                        id: userid,
                    },
                },
                adminid: {
                    not: userid,
                },
            },
            include: {
              _count: {
                select: { members: true }, // Get the member count
              },
            },
        });
        res.json({
            created_room,
            joined_room
        });
    } catch (error) { 
        console.log(error)
        res.status(500).json({message:"wrong something"})
    }
}
export const create_room=async (req,res) => {
    try {
        const userid=req.userId
        const roomname=req.body.newTeam.teamName
        const password=req.body.newTeam.password
        const discription=req.body.newTeam.description
        console.log(roomname)
        console.log(password)
        console.log(discription)
        const find_room=await prisma.team.findFirst({
            where:{
                name:roomname
            }
        })
        // console.log(userid)
        if(find_room){
         return    res.json({message:"room with the name alredy exists chose another"})
        }
        const room=await prisma.team.create({
            data:{
                name:roomname,
                adminid:userid,
                password:password,
                discription:discription
            }
        }) 
        const teamcode = await prisma.teamcode.create({
            data: {
                teamId: room.id, 
            }
        });
        await prisma.team.update({
            where: { id: room.id },
            data: {
                teamcode: {
                    connect: { id: teamcode.id },
                },
            },
        });
       return res.json({message:"room creted with name ",data:room})
    } catch (error) {
        res.status(500).json({ message: "Internal server error.", error: error.message });
    } 
}
export const join_room=async (req,res) => {
    try {
    const userid=req.userId
    const password=req.body.teamData.password
    const roomname=req.body.teamData.teamName
    
    const find_room=await prisma.team.findFirst({
        where:{
            name:roomname
        },
        include: {
            members: true,
        },
    })
    if(!find_room){
       return  res.json({message:'no such room exists'})
    }
    console.log(password)
    console.log(find_room)
    if(find_room.password!=password){
       return res.json({message:"password is wrong bkl"})
    }
    const user=await prisma.user.update({ 
      where: { id: userid},
      data: {
        teams: {
          connect: { id: find_room.id },
        }
    }
    })
    res.json({
        message:"joined the room",
        data:find_room
    })
} catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error.", error: error.message });
}
}
export const get_room_info=async (req,res) => {
    try {
        const roomid=req.params.roomid;
        const id= parseInt(roomid)
        if(id<=0){
          return  res.json({message:'wrong params check again'})
        }
        const find_room=await prisma.team.findFirst({
            where:{
                id
            },
            include: { 
                teamcode: {
                    include: {
                        maincodes: true,
                        pendingcodes: true,
                    },
                },
            },
        })
        // console.log(find_room.teamcode.maincodes)
        res.json({data:find_room.teamcode,name:find_room.name, message:"nice found one"})
    } catch (error) {
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}         