import React, { Fragment } from 'react';
import Head from 'next/head';

const Layout: React.FC<{ pageTitle?: string }> = (props) => {
	return (
		<Fragment>
			<Head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
				<link
					rel="stylesheet"
					href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
					integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
					crossOrigin="anonymous"
				/>
				<title>{props.pageTitle || 'Realtime Chat'}</title>
			</Head>
			{props.children}
		</Fragment>
	);
};

export default Layout;
