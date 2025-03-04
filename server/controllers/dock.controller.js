import db from '../models/index.js';
import { Op } from 'sequelize';

const { Dock, DockSchedule, Order, Client, Holiday } = db;

// Get all docks (with pagination and filtering)
const getAllDocks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, companyId, isBlocked, active } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const where = {};
    
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    
    if (companyId) {
      where.companyId = companyId;
    } else if (req.user.role !== 'admin') {
      // Non-admin users can only see docks from their company
      where.companyId = req.user.companyId;
    }
    
    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === 'true';
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    // Get docks with pagination
    const { count, rows: docks } = await Dock.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      docks,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get all docks error:', error);
    res.status(500).json({ message: 'Error fetching docks', error: error.message });
  }
};

// Get dock by ID
const getDockById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dock = await Dock.findByPk(id);
    
    if (!dock) {
      return res.status(404).json({ message: 'Dock not found' });
    }
    
    // Check if user has permission to view this dock
    if (req.user.role !== 'admin' && dock.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: dock belongs to another company' });
    }
    
    res.status(200).json({ dock });
  } catch (error) {
    console.error('Get dock by ID error:', error);
    res.status(500).json({ message: 'Error fetching dock', error: error.message });
  }
};

// Create a new dock
const createDock = async (req, res) => {
  try {
    const { name, workingHoursStart, workingHoursEnd, isBlocked, blockReason, companyId, active } = req.body;
    
    // Validate working hours format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (workingHoursStart && !timeRegex.test(workingHoursStart)) {
      return res.status(400).json({ message: 'Invalid working hours start format. Use HH:MM' });
    }
    if (workingHoursEnd && !timeRegex.test(workingHoursEnd)) {
      return res.status(400).json({ message: 'Invalid working hours end format. Use HH:MM' });
    }
    
    // Check if company exists
    const effectiveCompanyId = companyId || req.user.companyId;
    
    // Create dock
    const newDock = await Dock.create({
      name,
      workingHoursStart: workingHoursStart || '08:00',
      workingHoursEnd: workingHoursEnd || '17:00',
      isBlocked: isBlocked || false,
      blockReason,
      companyId: effectiveCompanyId,
      active: active !== undefined ? active : true
    });
    
    res.status(201).json({
      message: 'Dock created successfully',
      dock: newDock
    });
  } catch (error) {
    console.error('Create dock error:', error);
    res.status(500).json({ message: 'Error creating dock', error: error.message });
  }
};

// Update dock
const updateDock = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, workingHoursStart, workingHoursEnd, isBlocked, blockReason, active } = req.body;
    
    const dock = await Dock.findByPk(id);
    
    if (!dock) {
      return res.status(404).json({ message: 'Dock not found' });
    }
    
    // Check if user has permission to update this dock
    if (req.user.role !== 'admin' && dock.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: dock belongs to another company' });
    }
    
    // Validate working hours format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (workingHoursStart && !timeRegex.test(workingHoursStart)) {
      return res.status(400).json({ message: 'Invalid working hours start format. Use HH:MM' });
    }
    if (workingHoursEnd && !timeRegex.test(workingHoursEnd)) {
      return res.status(400).json({ message: 'Invalid working hours end format. Use HH:MM' });
    }
    
    // Update dock
    await dock.update({
      name: name || dock.name,
      workingHoursStart: workingHoursStart || dock.workingHoursStart,
      workingHoursEnd: workingHoursEnd || dock.workingHoursEnd,
      isBlocked: isBlocked !== undefined ? isBlocked : dock.isBlocked,
      blockReason: isBlocked ? blockReason : null,
      active: active !== undefined ? active : dock.active
    });
    
    res.status(200).json({
      message: 'Dock updated successfully',
      dock
    });
  } catch (error) {
    console.error('Update dock error:', error);
    res.status(500).json({ message: 'Error updating dock', error: error.message });
  }
};

// Delete dock (soft delete)
const deleteDock = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dock = await Dock.findByPk(id);
    
    if (!dock) {
      return res.status(404).json({ message: 'Dock not found' });
    }
    
    // Check if user has permission to delete this dock
    if (req.user.role !== 'admin' && dock.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: dock belongs to another company' });
    }
    
    // Check if dock has any schedules
    const scheduleCount = await DockSchedule.count({
      where: {
        dockId: id,
        status: {
          [Op.in]: ['scheduled', 'in_progress']
        }
      }
    });
    
    if (scheduleCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete dock with active schedules. Cancel or complete all schedules first.' 
      });
    }
    
    // Soft delete dock
    await dock.destroy();
    
    res.status(200).json({ message: 'Dock deleted successfully' });
  } catch (error) {
    console.error('Delete dock error:', error);
    res.status(500).json({ message: 'Error deleting dock', error: error.message });
  }
};

// Get dock schedule
const getDockSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startDate, endDate } = req.query;
    
    const dock = await Dock.findByPk(id);
    
    if (!dock) {
      return res.status(404).json({ message: 'Dock not found' });
    }
    
    // Check if user has permission to view this dock's schedule
    if (req.user.role !== 'admin' && dock.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: dock belongs to another company' });
    }
    
    // Build where clause for filtering by date
    const where = {
      dockId: id
    };
    
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.startTime = {
        [Op.gte]: selectedDate,
        [Op.lt]: nextDay
      };
    } else if (startDate && endDate) {
      where.startTime = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Get dock schedules
    const schedules = await DockSchedule.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['startTime', 'ASC']]
    });
    
    res.status(200).json({ schedules });
  } catch (error) {
    console.error('Get dock schedule error:', error);
    res.status(500).json({ message: 'Error fetching dock schedule', error: error.message });
  }
};

// Check dock availability
const checkDockAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, duration } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const dock = await Dock.findByPk(id);
    
    if (!dock) {
      return res.status(404).json({ message: 'Dock not found' });
    }
    
    // Check if user has permission to view this dock's availability
    if (req.user.role !== 'admin' && dock.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Access denied: dock belongs to another company' });
    }
    
    // Check if dock is blocked
    if (dock.isBlocked) {
      return res.status(400).json({ 
        message: 'Dock is blocked for maintenance',
        reason: dock.blockReason
      });
    }
    
    // Check if date is a holiday
    const holiday = await Holiday.findOne({
      where: {
        date: date,
        companyId: dock.companyId
      }
    });
    
    if (holiday) {
      return res.status(400).json({ 
        message: 'Selected date is a holiday',
        holiday: holiday.description
      });
    }
    
    // If startTime and endTime are provided, check if the slot is available
    if (startTime && endTime) {
      const selectedDate = new Date(date);
      const startDateTime = new Date(selectedDate);
      const [startHours, startMinutes] = startTime.split(':');
      startDateTime.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
      
      const endDateTime = new Date(selectedDate);
      const [endHours, endMinutes] = endTime.split(':');
      endDateTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);
      
      // Check if the requested time is within working hours
      const [dockStartHours, dockStartMinutes] = dock.workingHoursStart.split(':');
      const [dockEndHours, dockEndMinutes] = dock.workingHoursEnd.split(':');
      
      const dockStartTime = new Date(selectedDate);
      dockStartTime.setHours(parseInt(dockStartHours, 10), parseInt(dockStartMinutes, 10), 0, 0);
      
      const dockEndTime = new Date(selectedDate);
      dockEndTime.setHours(parseInt(dockEndHours, 10), parseInt(dockEndMinutes, 10), 0, 0);
      
      if (startDateTime < dockStartTime || endDateTime > dockEndTime) {
        return res.status(400).json({ 
          message: 'Requested time is outside dock working hours',
          workingHours: `${dock.workingHoursStart} - ${dock.workingHoursEnd}`
        });
      }
      
      // Check for overlapping schedules
      const overlappingSchedules = await DockSchedule.findAll({
        where: {
          dockId: id,
          status: {
            [Op.in]: ['scheduled', 'in_progress']
          },
          [Op.or]: [
            {
              // New schedule starts during an existing schedule
              startTime: {
                [Op.lt]: endDateTime
              },
              endTime: {
                [Op.gt]: startDateTime
              }
            }
          ]
        }
      });
      
      if (overlappingSchedules.length > 0) {
        return res.status(400).json({ 
          message: 'Time slot is not available',
          conflicts: overlappingSchedules
        });
      }
      
      return res.status(200).json({ 
        message: 'Time slot is available',
        available: true
      });
    }
    
    // If duration is provided, find available slots
    if (duration) {
      const durationMinutes = parseInt(duration, 10);
      
      // Ensure duration is a multiple of 10
      if (durationMinutes % 10 !== 0) {
        return res.status(400).json({ message: 'Duration must be a multiple of 10 minutes' });
      }
      
      const selectedDate = new Date(date);
      
      // Get all schedules for the dock on the selected date
      const schedules = await DockSchedule.findAll({
        where: {
          dockId: id,
          status: {
            [Op.in]: ['scheduled', 'in_progress']
          },
          startTime: {
            [Op.gte]: selectedDate,
            [Op.lt]: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        order: [['startTime', 'ASC']]
      });
      
      // Calculate available slots
      const [dockStartHours, dockStartMinutes] = dock.workingHoursStart.split(':');
      const [dockEndHours, dockEndMinutes] = dock.workingHoursEnd.split(':');
      
      const dockStartTime = new Date(selectedDate);
      dockStartTime.setHours(parseInt(dockStartHours, 10), parseInt(dockStartMinutes, 10), 0, 0);
      
      const dockEndTime = new Date(selectedDate);
      dockEndTime.setHours(parseInt(dockEndHours, 10), parseInt(dockEndMinutes, 10), 0, 0);
      
      const availableSlots = [];
      let currentTime = new Date(dockStartTime);
      
      // Helper function to format time as HH:MM
      const formatTime = (date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      };
      
      // Find available slots
      while (new Date(currentTime.getTime() + durationMinutes * 60 * 1000) <= dockEndTime) {
        const slotEndTime = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
        
        // Check if slot overlaps with any scheduled time
        const isOverlapping = schedules.some(schedule => {
          return (
            (currentTime < new Date(schedule.endTime) && slotEndTime > new Date(schedule.startTime))
          );
        });
        
        if (!isOverlapping) {
          availableSlots.push({
            startTime: formatTime(currentTime),
            endTime: formatTime(slotEndTime),
            duration: durationMinutes
          });
        }
        
        // Move to next 10-minute slot
        currentTime = new Date(currentTime.getTime() + 10 * 60 * 1000);
      }
      
      return res.status(200).json({ 
        date: selectedDate.toISOString().split('T')[0],
        workingHours: `${dock.workingHoursStart} - ${dock.workingHoursEnd}`,
        availableSlots
      });
    }
    
    // If neither time range nor duration is provided, return all schedules for the day
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const schedules = await DockSchedule.findAll({
      where: {
        dockId: id,
        startTime: {
          [Op.gte]: selectedDate,
          [Op.lt]: nextDay
        }
      },
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['startTime', 'ASC']]
    });
    
    res.status(200).json({ 
      date: selectedDate.toISOString().split('T')[0],
      workingHours: `${dock.workingHoursStart} - ${dock.workingHoursEnd}`,
      schedules
    });
  } catch (error) {
    console.error('Check dock availability error:', error);
    res.status(500).json({ message: 'Error checking dock availability', error: error.message });
  }
};

// Export all functions
export {
  getAllDocks,
  getDockById,
  createDock,
  updateDock,
  deleteDock,
  getDockSchedule,
  checkDockAvailability
};