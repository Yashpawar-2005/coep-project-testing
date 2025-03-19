import { prisma } from "../db/Connect.js"
const get_all_submissions=async (req,res) => {
    try {
        const adminid=req.userId;
        const roomid=req.params.roomid
        const data=await prisma.team.findFirst({
            where:{
                id:Number(roomid)
            },
            include:{
                teamcode:{
                    include:{
                        maincodes:true,
                        pendingcodes:true
                    }
                }
            }
        })
        res.json({message:"nice one done ",data:data})
    } catch (error) {
        console.log(error)
        res.json({message:"internall server error"})
    }
}


const movePendingToMain = async (req, res) => {
    try {
        const { pendingcodeId } = req.body; 
        const userid = req.userId; 
        const pendingcode = await prisma.tempcodes.findUnique({
            where: { id: pendingcodeId },
        })

        if (!pendingcode) {
            return res.status(404).json({ message: "Pending code not found." });
        }
        const teamcode = await prisma.teamcode.findFirst({
            where: {
                pendingcodes: {
                    some: { id: pendingcodeId },
                },
            },
        });

        if (!teamcode) {
            return res.status(403).json({ message: "You do not have permission to move this code." });
        }

        const updatedCode = await prisma.tempcodes.update({
            where: { id: pendingcodeId },
            data: {
                mainteamcode: {
                    connect: { id: teamcode.id }, 
                },
                pendingin: {
                    disconnect: true,
                },
            },
            include: {
                mainteamcode: true,
            },
        });
        res.status(200).json({
            message: "Pending code moved to main codes successfully.", 
            data: updatedCode,
        });
    } catch (error) {
        console.error("Error moving pending code to main codes:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};
 

export {get_all_submissions,movePendingToMain} 