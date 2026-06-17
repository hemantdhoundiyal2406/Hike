import { BriefcaseBusiness, CalendarDays, Clock3, Quote, TrendingUp, } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminUi";
import { getDashboardData } from "@/lib/admin-data";
export const dynamic = "force-dynamic";
function formatDate(value) {
    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}
export default async function AdminDashboardPage() {
    const data = await getDashboardData();
    const stats = [
        {
            label: "Total bookings",
            value: data.totalBookings,
            icon: CalendarDays,
            tone: "violet",
        },
        {
            label: "Total projects",
            value: data.totalProjects,
            icon: BriefcaseBusiness,
            tone: "blue",
        },
        {
            label: "Testimonials",
            value: data.totalTestimonials,
            icon: Quote,
            tone: "pink",
        },
        {
            label: "Recent bookings",
            value: data.recentBookings.length,
            icon: TrendingUp,
            tone: "green",
        },
    ];
    return (<>
      <AdminPageHeader eyebrow="Command center" title="Dashboard overview" description="A live view of the work, conversations and proof behind hike agency." action={<Link className="admin-primary-button" href="/admin/projects">
            <BriefcaseBusiness size={17}/>
            Add project
          </Link>}/>

      <section className="admin-stat-grid">
        {stats.map(({ label, value, icon: Icon, tone }, index) => (<article className={`admin-stat-card ${tone}`} key={label}>
            <div>
              <span>{label}</span>
              <strong>{value.toLocaleString()}</strong>
              <small>Synced with MongoDB</small>
            </div>
            <i>
              <Icon size={22}/>
            </i>
            <em>{String(index + 1).padStart(2, "0")}</em>
          </article>))}
      </section>

      <section className="admin-panel admin-recent-panel">
        <header className="admin-panel-header">
          <div>
            <p>Latest enquiries</p>
            <h2>Recent bookings</h2>
          </div>
          <Link href="/admin/bookings">View all bookings</Link>
        </header>

        {data.recentBookings.length ? (<div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Company</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((booking) => (<tr key={booking._id}>
                    <td>
                      <strong>{booking.name}</strong>
                      <small>{booking.email}</small>
                    </td>
                    <td>{booking.brandName}</td>
                    <td>
                      <span className="admin-date-cell">
                        <Clock3 size={14}/>
                        {booking.date} at {booking.time}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{formatDate(booking.createdAt)}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>) : (<div className="admin-inline-empty">
            New booking requests will appear here.
          </div>)}
      </section>
    </>);
}
