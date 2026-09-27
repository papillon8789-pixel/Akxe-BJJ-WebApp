import { useState, useEffect } from 'react';

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load events from JSON file
  useEffect(() => {
    fetch('/data/events.json')
      .then(response => response.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading events:', error);
        setLoading(false);
      });
  }, []);

  // Filter out past events and sort by date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3); // Max 3 events

  // Don't render if loading or no upcoming events
  if (loading || upcomingEvents.length === 0) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Get day of month for calendar icon
  const getDayOfMonth = (dateString) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  // Get month abbreviation for calendar icon
  const getMonthAbbr = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  };

  // Color variants for event cards
  const colorVariants = {
    red: {
      gradient: 'from-red-600/20 to-red-700/20',
      border: 'border-red-600/30',
      calendarBg: 'bg-gradient-to-br from-red-600 to-red-700',
      iconBg: 'bg-red-600/20',
      textAccent: 'text-red-400'
    },
    gold: {
      gradient: 'from-primo-gold/20 to-yellow-600/20',
      border: 'border-primo-gold/30',
      calendarBg: 'bg-gradient-to-br from-primo-gold to-yellow-600',
      iconBg: 'bg-primo-gold/20',
      textAccent: 'text-primo-gold'
    },
    blue: {
      gradient: 'from-blue-600/20 to-blue-700/20',
      border: 'border-blue-600/30',
      calendarBg: 'bg-gradient-to-br from-blue-600 to-blue-700',
      iconBg: 'bg-blue-600/20',
      textAccent: 'text-blue-400'
    },
    green: {
      gradient: 'from-green-600/20 to-green-700/20',
      border: 'border-green-600/30',
      calendarBg: 'bg-gradient-to-br from-green-600 to-green-700',
      iconBg: 'bg-green-600/20',
      textAccent: 'text-green-400'
    },
    purple: {
      gradient: 'from-purple-600/20 to-purple-700/20',
      border: 'border-purple-600/30',
      calendarBg: 'bg-gradient-to-br from-purple-600 to-purple-700',
      iconBg: 'bg-purple-600/20',
      textAccent: 'text-purple-400'
    }
  };

  return (
    <section className="bg-gradient-to-b from-app-bg to-card-bg py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            🎉 Upcoming Events
          </h2>
          <p className="text-primo-gold text-sm">
            Don't miss out on special events
          </p>
        </div>

        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const colors = colorVariants[event.color] || colorVariants.gold;
            
            return (
              <div
                key={event.id}
                className={`bg-gradient-to-br ${colors.gradient} ${colors.border} border rounded-xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex gap-4 items-start">
                  {/* Calendar Icon */}
                  <div className="flex-shrink-0">
                    <div className={`${colors.calendarBg} rounded-lg shadow-lg overflow-hidden w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center text-white`}>
                      <div className="text-xs font-semibold opacity-90">
                        {getMonthAbbr(event.date)}
                      </div>
                      <div className="text-2xl md:text-3xl font-bold leading-none">
                        {getDayOfMonth(event.date)}
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`${colors.iconBg} rounded-lg p-2 text-2xl flex-shrink-0`}>
                        {event.icon}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
                          {event.title}
                        </h3>
                        <p className={`${colors.textAccent} text-sm md:text-base font-medium`}>
                          {formatDate(event.date)} at {event.time}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-2">
                      {event.description}
                    </p>
                    
                    {/* Location Link */}
                    {event.location && (
                      <a
                        href={event.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 ${colors.textAccent} hover:underline text-sm font-medium transition-colors`}
                      >
                        <span>📍</span>
                        <span>View Location</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Mark your calendar and join us for these special occasions! 🥋
          </p>
        </div>
      </div>
    </section>
  );
}
