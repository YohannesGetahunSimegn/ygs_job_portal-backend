const JobPost = require('../models/JobPost');

// Create a new job post
exports.createJobPost = async (req, res) => {
    const {
        jobTitle,
        location,
        jobType,
        workplaceType,
        description,
        responsibilities,
        tags,
        vacancy,
        email,
        mobileNumber,
        companyName,
        companyWebsite,
        social_media_link,
        expires_at,
        pay,
        skills,
    } = req.body;

    let admin_id = req.user?.userId; // Check if the user is authenticated
    let approved = 'Approved'; // Assume job is approved if the user is authenticated

    // If no token is provided, set admin_id to null and approved to false
    if (!admin_id) {
        approved = false; // Set to unapproved if the user is not authenticated
    }

    try {
        const jobPost = new JobPost({
            jobTitle,
            location,
            jobType,
            workplaceType,
            description,
            responsibilities,
            tags,
            vacancy,
            email,
            mobileNumber,
            companyName,
            companyWebsite,
            social_media_link: social_media_link || null,
            admin_id,
            approved, // Set to false if unauthenticated
            expires_at,
            pay,
            skills,
        });

        await jobPost.save();
        res.status(201).json({ message: 'Job post created', jobPost });
    } catch (error) {
        res.status(500).json({ message: 'Error creating job post', error });
    }
};




// Get all job posts (admin-only can see unapproved jobs)
exports.getAllJobPosts = async (req, res) => {
    const filter = req.user?.role === 'admin' ? {} : { approved: true };

    try {
        const jobPosts = await JobPost.find(filter)
            .populate('admin_id', 'name email') // Fetch admin's name and email
            .exec();

        res.status(200).json(jobPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job posts', error });
    }
};


// Approve a job post (admin only)
exports.approveJobPost = async (req, res) => {
    const { id } = req.params;

    try {
        const jobPost = await JobPost.findByIdAndUpdate(
            id,
            { approved: true },
            { new: true }
        );

        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        res.status(200).json({ message: 'Job post approved', jobPost });
    } catch (error) {
        res.status(500).json({ message: 'Error approving job post', error });
    }
};

// Update a job post (admin only)
exports.updateJobPost = async (req, res) => {
    const { id } = req.params;
    const { title, description, location, job_type, skill_requirements } = req.body;

    try {
        const jobPost = await JobPost.findByIdAndUpdate(
            id,
            { title, description, location, job_type, skill_requirements },
            { new: true }
        );

        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        res.status(200).json({ message: 'Job post updated', jobPost });
    } catch (error) {
        res.status(500).json({ message: 'Error updating job post', error });
    }
};

// Delete a job post (admin only)
exports.deleteJobPost = async (req, res) => {
    const { id } = req.params;

    try {
        const jobPost = await JobPost.findByIdAndDelete(id);

        if (!jobPost) {
            return res.status(404).json({ message: 'Job post not found' });
        }

        res.status(200).json({ message: 'Job post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job post', error });
    }
};
