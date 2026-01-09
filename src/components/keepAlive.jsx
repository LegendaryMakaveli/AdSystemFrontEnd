import { useHealthCheckQuery } from "../apis/authApis";

const KeepAlive = () => {useHealthCheckQuery(undefined, {
    pollingInterval: 10 * 60 * 1000,
    });
    return null;
};
export default KeepAlive;