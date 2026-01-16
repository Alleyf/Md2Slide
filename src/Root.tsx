// 这个文件暂时不使用，因为我们使用React应用而不是Remotion渲染
// 保留作为未来扩展使用

// import React from 'react';
// import { Composition, Still } from 'remotion';
// import { PaperViewer } from './components/PaperViewer';
// import { samplePaper, fourierPaper } from './data/samplePaper';

// export const Root: React.FC = () => {
//   return (
//     <>
//       {/* 梯度下降论文演示 */}
//       <Composition
//         id="GradientDescentPaper"
//         component={PaperViewer}
//         durationInFrames={120 * (1 + samplePaper.sections.length)} // 每页120帧
//         fps={30}
//         width={1920}
//         height={1080}
//         defaultProps={{
//           paper: samplePaper,
//           autoPlay: false,
//           showNavigation: true,
//           transitionDuration: 30,
//         }}
//       />
      
//       {/* 傅里叶变换论文演示 */}
//       <Composition
//         id="FourierTransformPaper"
//         component={PaperViewer}
//         durationInFrames={120 * (1 + fourierPaper.sections.length)}
//         fps={30}
//         width={1920}
//         height={1080}
//         defaultProps={{
//           paper: fourierPaper,
//           autoPlay: false,
//           showNavigation: true,
//           transitionDuration: 30,
//         }}
//       />
      
//       {/* 自动播放版本 */}
//       <Composition
//         id="AutoPlayDemo"
//         component={PaperViewer}
//         durationInFrames={120 * (1 + samplePaper.sections.length)}
//         fps={30}
//         width={1920}
//         height={1080}
//         defaultProps={{
//           paper: samplePaper,
//           autoPlay: true,
//           showNavigation: false,
//           transitionDuration: 30,
//         }}
//       />
//     </>
//   );
// };