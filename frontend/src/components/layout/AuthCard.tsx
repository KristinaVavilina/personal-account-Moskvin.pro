import moskvinLogo from '../../assets/icons/moskvin-logo.svg';
import './AuthCard.scss';

interface AuthCardProps {
  children: React.ReactNode;
}

export const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__form-side">{children}</div>

        <div className="auth-card__brand-side">
          <div className="auth-card__logo">
            <img src={moskvinLogo} alt="Moskvin.pro" />
          </div>
        </div>
      </div>
    </div>
  );
};
