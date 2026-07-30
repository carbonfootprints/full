import { useState, useEffect } from 'react';
import axiosServices from 'utils/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Returns whether the admin has released calculation results to this user.
 * Results in category forms are hidden until the admin releases them.
 */
export default function useResultsReleased() {
  const [resultsReleased, setResultsReleased] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axiosServices
      .get(`${API_URL}/api/orguser/report-status`)
      .then((res) => {
        setResultsReleased(res.data?.reportVisible === true);
      })
      .catch(() => {
        setResultsReleased(false);
      });
  }, []);

  return resultsReleased;
}
