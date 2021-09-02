// @flow
import React from 'react';
import { Image, Text, View, StyleSheet } from '@react-pdf/renderer';
import colors from '~/styles/modules/colors';

const styles = StyleSheet.create({
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 10,
    right: 0,
    textAlign: 'center',
    color: colors.gray['900'],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 35,
    right: 35,
    paddingVertical: 8,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'left',
    borderTop: '2',
    borderTopColor: colors.gray['100'],
    height: 40,
  },
  footer_logo: {
    'object-fit': 'cover',
  },
  footer_text: {
    fontFamily: 'OpenSans',
    color: colors.gray['800'],
    fontSize: 10,
  },
});

type Props = {
  logoUrl: string,
  title: string,
};

const Footer = ({ logoUrl, title }: Props) => {
  return (
    <View fixed style={styles.footer}>
      <Image style={styles.footer_logo} src={logoUrl} />
      <Text style={styles.footer_text}>{title}</Text>
      <Text style={styles.footer_text} render={({ pageNumber }) => `${pageNumber}`} fixed />
    </View>
  );
};

export default Footer;
