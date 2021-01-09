const allReds = ['#fff5f0','#fff4ef','#fff4ee','#fff3ed','#fff2ec','#fff2eb','#fff1ea','#fff0e9','#fff0e8','#ffefe7','#ffeee6','#ffeee6','#ffede5','#ffece4','#ffece3','#ffebe2','#feeae1','#fee9e0','#fee9de','#fee8dd','#fee7dc','#fee6db','#fee6da','#fee5d9','#fee4d8','#fee3d7','#fee2d6','#fee2d5','#fee1d4','#fee0d2','#fedfd1','#feded0','#feddcf','#fedccd','#fedbcc','#fedacb','#fed9ca','#fed8c8','#fed7c7','#fdd6c6','#fdd5c4','#fdd4c3','#fdd3c1','#fdd2c0','#fdd1bf','#fdd0bd','#fdcfbc','#fdceba','#fdcdb9','#fdccb7','#fdcbb6','#fdc9b4','#fdc8b3','#fdc7b2','#fdc6b0','#fdc5af','#fdc4ad','#fdc2ac','#fdc1aa','#fdc0a8','#fcbfa7','#fcbea5','#fcbca4','#fcbba2','#fcbaa1','#fcb99f','#fcb89e','#fcb69c','#fcb59b','#fcb499','#fcb398','#fcb196','#fcb095','#fcaf94','#fcae92','#fcac91','#fcab8f','#fcaa8e','#fca98c','#fca78b','#fca689','#fca588','#fca486','#fca285','#fca183','#fca082','#fc9e81','#fc9d7f','#fc9c7e','#fc9b7c','#fc997b','#fc987a','#fc9778','#fc9677','#fc9475','#fc9374','#fc9273','#fc9071','#fc8f70','#fc8e6f','#fc8d6d','#fc8b6c','#fc8a6b','#fc8969','#fc8868','#fc8667','#fc8565','#fc8464','#fb8263','#fb8162','#fb8060','#fb7f5f','#fb7d5e','#fb7c5d','#fb7b5b','#fb795a','#fb7859','#fb7758','#fb7657','#fb7455','#fa7354','#fa7253','#fa7052','#fa6f51','#fa6e50','#fa6c4e','#f96b4d','#f96a4c','#f9684b','#f9674a','#f96549','#f86448','#f86347','#f86146','#f86045','#f75e44','#f75d43','#f75c42','#f65a41','#f65940','#f6573f','#f5563e','#f5553d','#f4533c','#f4523b','#f4503a','#f34f39','#f34e38','#f24c37','#f24b37','#f14936','#f14835','#f04734','#ef4533','#ef4433','#ee4332','#ed4131','#ed4030','#ec3f2f','#eb3d2f','#eb3c2e','#ea3b2d','#e93a2d','#e8382c','#e7372b','#e6362b','#e6352a','#e5342a','#e43229','#e33128','#e23028','#e12f27','#e02e27','#df2d26','#de2c26','#dd2b25','#dc2a25','#db2924','#da2824','#d92723','#d72623','#d62522','#d52422','#d42321','#d32221','#d22121','#d12020','#d01f20','#ce1f1f','#cd1e1f','#cc1d1f','#cb1d1e','#ca1c1e','#c91b1e','#c71b1d','#c61a1d','#c5191d','#c4191c','#c3181c','#c2181c','#c0171b','#bf171b','#be161b','#bd161a','#bb151a','#ba151a','#b91419','#b81419','#b61419','#b51319','#b41318','#b21218','#b11218','#b01218','#ae1117','#ad1117','#ac1117','#aa1017','#a91016','#a71016','#a60f16','#a40f16','#a30e15','#a10e15','#a00e15','#9e0d15','#9c0d14','#9b0c14','#990c14','#970c14','#960b13','#940b13','#920a13','#900a13','#8f0a12','#8d0912','#8b0912','#890812','#870811','#860711','#840711','#820711','#800610','#7e0610','#7c0510','#7a0510','#78040f','#76040f','#75030f','#73030f','#71020e','#6f020e','#6d010e','#6b010e','#69000d','#67000d'];

module.exports = {
  colours: {
    lightGrey: '#eee',
    darkGrey: '#999',
    darkerGrey: '#666',
    veryDarkGrey: '#333',
    black: '#000',
    light: allReds[Math.ceil(allReds.length / 8)],
    medium: allReds[Math.ceil(allReds.length / 2)],
    dark: allReds[Math.ceil(allReds.length / 1.2)],
    veryDark: allReds[Math.ceil(allReds.length)],
    reds: allReds
  }
}