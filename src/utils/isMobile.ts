const isMobile = typeof window !== 'undefined' ? !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false : false;

export default isMobile;
