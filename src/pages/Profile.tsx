import React, { PureComponent } from 'react';
import Template from '../components/ProfileTemplate';
class Profile extends PureComponent {
  render() {
    const profile = JSON.parse(window.sessionStorage.getItem('profile')!);
    const parsedProfile = {
      ...profile,
      dateofbirth: new Date(profile.dateofbirth),
      dateofemployment: new Date(profile.dateofemployment)
    };
    return (
      <Template profile={parsedProfile} />
    );
  }
}

export default Profile;
