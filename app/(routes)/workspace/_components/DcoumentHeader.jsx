import { Button } from '@/components/ui/button';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import React from 'react';
import AvatarStack from './AvatarStack'; // Import the AvatarStack component

function DcoumentHeader() {
  return (
    <div  className="no-print">
    <div className='flex justify-between items-center p-3 px-7 shadow-md'>
      <div></div>
      <OrganizationSwitcher className="no-print"
       afterSelectOrganizationUrl={'/dashboard'}
       afterLeaveOrganizationUrl={'/dashboard'}/>
      <div className='flex gap-1 items-center'>
        <AvatarStack className="no-print"/> {/* Add the AvatarStack here */}
        
        <UserButton className="no-print"/>
        <Button onClick={() => window.print()} className="no-print">
            Share As PDF
        </Button>
      </div>
    </div>
    </div>
  );
}

export default DcoumentHeader;