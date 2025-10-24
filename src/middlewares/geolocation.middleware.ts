import type { Request, Response, NextFunction } from "express";
import geoip from "fast-geoip";

const geoLocation = async (req: Request, res: Response, next: NextFunction) => {
	const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
	if (!ip) return next();
	const geo = await geoip.lookup(ip);
	if (!geo) return next();
	req.geo = geo;
	next();
};

export default geoLocation;
