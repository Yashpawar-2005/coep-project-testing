import { prisma } from "../db/Connect.js"

export const get_rooms=async (req,res) => {
    try{
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
                select: { members: true }, 
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
export const create_room = async (req, res) => {
    try {
      const userid = req.userId;
      const roomname = req.body.newTeam.teamName;
      const password = req.body.newTeam.password;
      const discription = req.body.newTeam.description;
  
      console.log(roomname, password, discription);
  
      // Check if the room already exists
      const find_room = await prisma.team.findFirst({
        where: {
          name: roomname,
        },
      });
  
      if (find_room) {
        return res.json({ message: "Room with this name already exists. Choose another." });
      }
  
      // Create the team and capture the result in 'room'
      const room = await prisma.team.create({
        data: {
          name: roomname,
          password: password,
          description: discription,
          admin: {
            connect: { id: userid },
          },
        },
      });
  
      // Create a team code linked to the created team
      const teamcode = await prisma.teamcode.create({
        data: {
          teamId: room.id, // Use room.id here
        },
      });
  
      // Update the team with the generated team code
      await prisma.team.update({
        where: { id: room.id },
        data: {
          teamcode: {
            connect: { id: teamcode.id },
          },
        },
      });
  
      return res.json({ message: "Room created successfully", data: room });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error.", error: error.message });
    }
  };
  
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
                        pendingcodes: {
                            where:{
                                ispending:false
                            }
                        }
                    },
                },
            },
        })
        res.json({data:find_room.teamcode,name:find_room.name, message:"nice found one"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
} 
export const get_all_rooms_info = async (req, res) => {
    try {
      const { id } = req.params;
      const teamid = parseInt(id);
      const userid = req.userId;
  
      if (isNaN(teamid)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
  
      const data = await prisma.team.findUnique({
        where: { id: teamid },
        include: {
          teamcode: {
            include: {
              pendingcodes: {
                include: {
                  user: true, 
                },
              },
            },
          },
        },
      });
  
      if (!data) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      res.status(200).json({ message: "Fetched team data successfully", data });
    } catch (error) {
      console.error("Error fetching team info:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
  export const get_maincode_info = async (req, res) => {
    try {
      const { id } = req.params;
      const teamid = parseInt(id);
  
      // Fetch both schemas and queries in a single call
      const teamData = await prisma.team.findUnique({
        where: { id: teamid },
        include: {
          teamcode: {
            include: {
              pendingcodes: {
                where: {
                  type: { in: ["schema", "query"] },
                  ispending:false
                },
              },
            },
          },
        },
      });
  
      if (!teamData) {
        return res.status(404).json({ message: "Team not found" });
      }
  
      // Separate schemas and queries
      const schemas = teamData.teamcode?.pendingcodes.filter(
        (code) => code.type === "schema"
      );
      const queries = teamData.teamcode?.pendingcodes.filter(
        (code) => code.type === "query"
      );
  
      res.json({
        message: "Data retrieved successfully",
        schemas,
        queries,
      });
    } catch (error) {
      console.error("Error fetching team info:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };
