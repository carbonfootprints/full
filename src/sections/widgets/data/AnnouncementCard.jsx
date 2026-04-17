// project-imports
import MainCard from 'components/MainCard';
import branding from 'branding.json';

// ==============================|| WIDGETS DATA - ANNOUNCEMENT CARD ||============================== //

export default function AnnouncementCard() {
  return (
    <MainCard title="Welcome to PlanetCare">
      <p>{branding.brandName} helps you track, manage, and reduce your organisation&apos;s carbon emissions across all GHG scopes.</p>
    </MainCard>
  );
}
