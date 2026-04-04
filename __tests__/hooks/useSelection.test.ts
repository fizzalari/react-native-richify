import { renderHook, act } from '@testing-library/react-native';
import { useSelection } from '@/hooks/useSelection';

describe('useSelection', () => {
  it('initializes with default selection (0, 0)', () => {
    const { result } = renderHook(() => useSelection());
    expect(result.current.selection).toEqual({ start: 0, end: 0 });
  });

  it('initializes with custom selection', () => {
    const { result } = renderHook(() =>
      useSelection({ start: 5, end: 10 }),
    );
    expect(result.current.selection).toEqual({ start: 5, end: 10 });
  });

  it('updates selection via handleSelectionChange', () => {
    const { result } = renderHook(() => useSelection());

    act(() => {
      result.current.handleSelectionChange({ start: 3, end: 7 });
    });

    expect(result.current.selection).toEqual({ start: 3, end: 7 });
  });

  it('reports hasSelection correctly', () => {
    const { result } = renderHook(() => useSelection());

    expect(result.current.hasSelection()).toBe(false);

    act(() => {
      result.current.handleSelectionChange({ start: 0, end: 5 });
    });

    expect(result.current.hasSelection()).toBe(true);
  });

  it('getSelection returns current selection', () => {
    const { result } = renderHook(() => useSelection());

    act(() => {
      result.current.handleSelectionChange({ start: 2, end: 8 });
    });

    expect(result.current.getSelection()).toEqual({ start: 2, end: 8 });
  });

  it('setSelection directly updates selection', () => {
    const { result } = renderHook(() => useSelection());

    act(() => {
      result.current.setSelection({ start: 10, end: 20 });
    });

    expect(result.current.selection).toEqual({ start: 10, end: 20 });
  });
});
