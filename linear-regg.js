const regress = (x, y) => {
    const n = y.length;
    let sx = 0;
    let sy = 0;
    let sxy = 0;
    let sxx = 0;
    let syy = 0;
    for (let i = 0; i < n; i++) {
        sx += x[i];
        sy += y[i];
        sxy += x[i] * y[i];
        sxx += x[i] * x[i];
        syy += y[i] * y[i];
    }
    const mx = sx / n;
    const my = sy / n;
    const yy = n * syy - sy * sy;
    const xx = n * sxx - sx * sx;
    const xy = n * sxy - sx * sy;
    const slope = xy / xx;
    const intercept = my - slope * mx;
    const r = xy / Math.sqrt(xx * yy);
    const r2 = Math.pow(r,2);
    let sst = 0;
    for (let i = 0; i < n; i++) {
       sst += Math.pow((y[i] - my), 2);
    }
    const sse = sst - r2 * sst;
    const see = Math.sqrt(sse / (n - 2));
    const ssr = sst - sse;
    return {slope, intercept, r, r2, sse, ssr, sst, sy, sx, see};
}
regress([1, 2, 3, 4, 5], [1, 2, 3, 4, 3]);
