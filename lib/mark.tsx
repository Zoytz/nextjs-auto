export function getAllMarks(marksArr: string[]) {
  return marksArr.map((mark: string) => {
    return {
      params: {
        carMark: mark,
      },
    };
  });
};