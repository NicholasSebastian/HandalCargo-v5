import React, { PureComponent } from 'react';
import Template from '../components/ProfileTemplate';
class Profile extends PureComponent {
  render() {
    const profile = JSON.parse(window.sessionStorage.getItem('profile')!);
    return (
      <Template profile={profile} />
    );
  }
}

export default Profile;
