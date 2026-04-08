import { useState, useEffect, useCallback } from 'react';
import alertBellIcon from '../../assets/icons/alert-bell-icon.svg';
import alertBellIconGray from '../../assets/icons/alert-bell-icon-gray.svg';
import { StatusReportModal } from './StatusReportModal';
import { type AlertState, RESET_HOUR } from '../../constants';
import { getTimeUntilDeadline, computeAutoState, parseStatusReportScaleToChart } from '../../utils';
import { useBenefitWorkloadLocalStore } from '../../store/useBenefitWorkloadLocalStore';
import './AlertMessage.scss';

interface AlertMessageProps {
  debugState?: AlertState | null;
}

export const AlertMessage = ({ debugState = null }: AlertMessageProps) => {
  const [reportFilled, setReportFilled] = useState(false);
  const [autoState, setAutoState] = useState<AlertState>(
    () => debugState ?? computeAutoState(false),
  );
  const [timeLeft, setTimeLeft] = useState(getTimeUntilDeadline);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeState = reportFilled ? 'done' : (debugState ?? autoState);

  const tick = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= RESET_HOUR && hour < 1 && reportFilled) {
      setReportFilled(false);
    }

    if (!reportFilled && debugState === null) {
      setAutoState(computeAutoState(reportFilled));
    }
    setTimeLeft(getTimeUntilDeadline());
  }, [reportFilled, debugState]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [tick]);

  const handleClick = () => {
    if (activeState === 'default') {
      setIsModalOpen(true);
    }
  };

  const handleReportSave = (data: { benefit: string; workload: string }) => {
    const now = new Date();
    useBenefitWorkloadLocalStore.getState().setTodayChartPoint({
      year: now.getFullYear(),
      monthIndex: now.getMonth(),
      day: now.getDate(),
      benefit: parseStatusReportScaleToChart(data.benefit),
      workload: parseStatusReportScaleToChart(data.workload),
    });
    setIsModalOpen(false);
    setReportFilled(true);
  };

  const isClickable = activeState === 'default';
  const Tag = isClickable ? 'button' : 'div';

  const timeText =
    timeLeft.hours > 0
      ? `Через ${timeLeft.hours} ч. ${timeLeft.minutes} мин. необходимо заполнить ежедневную отчётность загруженности и пользы`
      : `Через ${timeLeft.minutes} мин. необходимо заполнить ежедневную отчётность загруженности и пользы`;

  const stateTextMap: Record<AlertState, string> = {
    time: timeText,
    default: 'Необходимо заполнить ежедневную отчётность загруженности и пользы',
    done: 'Отчётность загруженности и пользы отправлена',
  };

  const iconMap: Record<AlertState, string> = {
    time: alertBellIconGray,
    default: alertBellIcon,
    done: alertBellIconGray,
  };

  return (
    <>
      <Tag
        className={`alert-message alert-message--${activeState}`}
        onClick={isClickable ? handleClick : undefined}
        type={isClickable ? 'button' : undefined}
      >
        <p className="alert-message__text">{stateTextMap[activeState]}</p>
        <img
          className="alert-message__icon"
          src={iconMap[activeState]}
          alt="Уведомление"
        />
      </Tag>

      {isModalOpen && (
        <StatusReportModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleReportSave}
        />
      )}
    </>
  );
};
