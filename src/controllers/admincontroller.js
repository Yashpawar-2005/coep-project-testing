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
        const { pendingcodeId } = req.body; // ID of the pendingcode to move
        const userid = req.userId; // ID of the user performing the action

        // Fetch the pendingcode to ensure it exists
        const pendingcode = await prisma.tempcodes.findUnique({
            where: { id: pendingcodeId },
        });

        if (!pendingcode) {
            return res.status(404).json({ message: "Pending code not found." });
        }

        // Ensure the pendingcode belongs to the user's team
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

        // Move the pendingcode to maincodes
        const updatedCode = await prisma.tempcodes.update({
            where: { id: pendingcodeId },
            data: {
                teamcode: {
                    connect: { id: teamcode.id }, // Link to maincodes
                },
                pendingin: {
                    disconnect: true, // Remove from pendingcodes
                },
            },
            include: {
                teamcode: true, // Include the updated teamcode relation
            },
        });

        // Return success response
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