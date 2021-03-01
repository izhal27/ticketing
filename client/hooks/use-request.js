import { useState } from 'react';
import axios from 'axios';

import Alert from '../components/alert';

export default function useRequest({ url, method, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);

      const res = await axios[method](url, { ...body, ...props });

      if (onSuccess) {
        onSuccess(res.data);
      }

      return res.data;
    } catch (err) {
      const { errors } = err.response.data;

      setErrors(<Alert errors={errors} />);
    }
  };

  return [doRequest, errors];
}
