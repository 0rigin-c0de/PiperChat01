import React from 'react'
import rightnav_dashboardcss from '../rightnav_dashboard/rightnav_dashboard.module.css'

function Rightnav_dashboard() {
  return (
        
      <>
            <div className={rightnav_dashboardcss.right_nav_comps} id={rightnav_dashboardcss.item_1}>
                Active Now
            </div>

            <div className={rightnav_dashboardcss.right_nav_comps} id={rightnav_dashboardcss.item_2_wrap}>
                <div className={rightnav_dashboardcss.item_2_comps} id={rightnav_dashboardcss.item_2_1}>It's quiet for now...</div>
                <div className={rightnav_dashboardcss.item_2_comps} id={rightnav_dashboardcss.item_2_2}>
                When a friend starts an activity  like playing a game or hanging out on voice  we'll show it here!
                </div>
            </div>
        </>
        
  
  )
}

export default Rightnav_dashboard