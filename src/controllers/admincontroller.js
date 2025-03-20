import { prisma } from "../db/Connect.js"
const get_all_submissions = async (req, res) => {
    try {
        const adminid = req.userId;
        const roomid = req.params.roomid;

        const data = await prisma.team.findFirst({
            where: {
                id: Number(roomid)
            },
            include: {
                teamcode: {
                    include: {
                        pendingcodes: {
                            where: {
                                ispending: true
                            }
                        }
                    }
                }
            }
        });

        res.json({ message: "Nice one, done!", data: data });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const movePendingToMain = async (req, res) => {
    try {
        const { pendingcodeId } = req.body;
        const userid = req.userId;

        // Find the pending code
        const pendingcode = await prisma.tempcodes.findUnique({
            where: { id: pendingcodeId },
            include: { pendingin: true }
        });

        if (!pendingcode) {
            return res.status(404).json({ message: "Pending code not found." });
        }

        // Check if the user has permission
        const teamcode = await prisma.teamcode.findFirst({
            where: {
                id: pendingcode.pendingteamcodeid,
                team: {
                    members: { some: { id: userid } },
                },
            },
        });

        if (!teamcode) {
            return res.status(403).json({ message: "You do not have permission to move this code." });
        }

        // Update the code: mark as non-pending but keep the relation
        const updatedCode = await prisma.tempcodes.update({
            where: { id: pendingcodeId },
            data: {
                ispending: false,  // Mark as main code but keep relation
            },
        });

        return res.status(200).json({
            message: "Pending code moved to main codes successfully while maintaining the relation.",
            data: updatedCode,
        });
    } catch (error) {
        console.error("Error moving pending code to main codes:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

 

export {get_all_submissions,movePendingToMain} 