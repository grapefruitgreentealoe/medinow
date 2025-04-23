import { GetServerSideProps } from 'next';

const UserThanksPage = () => {
  return <div>Enter</div>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {},
  };
};

export default UserThanksPage;
