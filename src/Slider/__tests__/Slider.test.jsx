import React from 'react';
import { shallow, mount } from 'enzyme';
import clone from 'clone';
import components from '../../helpers/component-config';
import Slider from '../Slider';

const touch100 = {
  targetTouches: [
    {
      screenX: 100,
      screenY: 100,
    },
  ],
};

describe('<Slider />', () => {
  let props;
  beforeEach(() => {
    props = clone(components.Slider.props);
  });
  it('should render', () => {
    const wrapper = shallow(<Slider {...props} />);
    expect(wrapper.exists()).toBe(true);
  });
  it('should not update the state if touched and touchEnabled is false', () => {
    const wrapper = shallow(<Slider {...props} touchEnabled={false} />);
    expect(wrapper.state('isMoving')).toBe(false);
    wrapper.find('.sliderTray').simulate('touchstart');
    wrapper.update();
    expect(wrapper.state('isMoving')).toBe(false);
  });
  it('should change state values when slider tray is touched', () => {
    const wrapper = shallow(<Slider {...props} />);
    expect(wrapper.state('isMoving')).toBe(false);
    wrapper.find('.sliderTray').simulate('touchstart', touch100);
    wrapper.update();
    expect(wrapper.state('isMoving')).toBe(true);
    expect(wrapper.state('startX')).toBe(100);
    expect(wrapper.state('startY')).toBe(100);
  });
  it('should update deltaX and deltaY when touchmoving', () => {
    const wrapper = shallow(<Slider {...props} />);
    expect(wrapper.state('startX')).toBe(0);
    expect(wrapper.state('startY')).toBe(0);
    wrapper.find('.sliderTray').simulate('touchmove', touch100);
    expect(wrapper.state('deltaX')).toBe(100);
    expect(wrapper.state('deltaY')).toBe(100);
  });
  it('touchmove should not alter state if touchEnabled is false', () => {
    const wrapper = shallow(<Slider {...props} touchEnabled={false} />);
    expect(wrapper.state('startX')).toBe(0);
    expect(wrapper.state('startY')).toBe(0);
    wrapper.find('.sliderTray').simulate('touchmove', touch100);
    expect(wrapper.state('deltaX')).toBe(0);
    expect(wrapper.state('deltaY')).toBe(0);
  });
  it('should assign the correct vertical css classes when orientation="vertical"', () => {
    const wrapper = shallow(<Slider {...props} orientation="vertical" />);
    expect(wrapper.find('.carousel__slider').hasClass('verticalSlider')).toBe(true);
    expect(wrapper.find('.carousel__slider').hasClass('carousel__slider--vertical')).toBe(true);
    expect(wrapper.find('.carousel__slider-tray').hasClass('verticalTray')).toBe(true);
    expect(wrapper.find('.carousel__slider-tray').hasClass('carousel__slider-tray--vertical')).toBe(true);
    expect(wrapper.find('.carousel__slider-tray-wrapper').hasClass('verticalSlideTrayWrap')).toBe(true);
    expect(wrapper.find('.carousel__slider-tray-wrapper').hasClass('carousel__slider-tray-wrap--vertical')).toBe(true);
  });
  it('Slider.slideSizeInPx should return 100 given the test conditions (horizontal)', () => {
    expect(Slider.slideSizeInPx(
      'horizontal',
      400,
      100,
      4,
    )).toBe(100);
  });
  it('Slider.slideSizeInPx should return 100 given the test conditions (vertical)', () => {
    expect(Slider.slideSizeInPx(
      'vertical',
      100,
      400,
      4,
    )).toBe(100);
  });
  it('Slider.slidesMoved should return 0 given the test conditions (horizontal)', () => {
    expect(Slider.slidesMoved(
      'horizontal',
      49,
      0,
      100,
    )).toBe(0);
  });
  it('Slider.slidesMoved should return -1 given the test conditions (horizontal)', () => {
    expect(Slider.slidesMoved(
      'horizontal',
      50,
      0,
      100,
    )).toBe(-1);
  });
  it('Slider.slidesMoved should return 0 given the test conditions (vertical)', () => {
    expect(Slider.slidesMoved(
      'vertical',
      0,
      49,
      100,
    )).toBe(0);
  });
  it('Slider.slidesMoved should return -1 given the test conditions (vertical)', () => {
    expect(Slider.slidesMoved(
      'vertical',
      0,
      50,
      100,
    )).toBe(-1);
  });
  it('Should move the slider to slide 2 (index 1 since slide numbering starts at 0) on touchend given the test conditions', () => {
    const wrapper = mount(<Slider {...props} />);
    const instance = wrapper.instance();
    wrapper.setState({
      deltaX: -51,
      deltaY: 0,
    });
    wrapper.update();
    instance.sliderTrayDiv = {
      clientWidth: 500,
      clientHeight: 100,
    };
    wrapper.find('.sliderTray').simulate('touchend', { targetTouches: [] });
    expect(props.store.state.currentSlide).toBe(1);
  });
  it('Should keep the slider on slide 0 on touchend when dragging the slider past the start of the slide show.', () => {
    const wrapper = mount(<Slider {...props} />);
    const instance = wrapper.instance();
    wrapper.setState({
      deltaX: 1000,
      deltaY: 0,
    });
    wrapper.update();
    instance.sliderTrayDiv = {
      clientWidth: 500,
      clientHeight: 100,
    };
    wrapper.find('.sliderTray').simulate('touchend', { targetTouches: [] });
    expect(props.store.state.currentSlide).toBe(0);
  });
  it('Should move the slider to totalSlides - visibleSlides - 1 when dragging past the last slide.', () => {
    const wrapper = mount(<Slider {...props} />);
    const instance = wrapper.instance();
    wrapper.setState({
      deltaX: -1000,
      deltaY: 0,
    });
    wrapper.update();
    instance.sliderTrayDiv = {
      clientWidth: 500,
      clientHeight: 100,
    };
    wrapper.find('.sliderTray').simulate('touchend', { targetTouches: [] });
    expect(props.store.state.currentSlide).toBe(3);
  });
  it('should not change the state at all when touchEnd and touchEnabled prop is false', () => {
    const wrapper = shallow(<Slider {...props} touchEnabled={false} />);
    // nonsense values to test that slider state is not reset on touchend
    wrapper.setState({
      deltaX: 100,
      deltaY: 100,
      isMoving: true,
    });
    wrapper.update();
    wrapper.find('.sliderTray').simulate('touchend', { targetTouches: [] });
    wrapper.update();
    expect(wrapper.state('deltaX')).toBe(100);
    expect(wrapper.state('deltaY')).toBe(100);
    expect(wrapper.state('isMoving')).toBe(true);
  });
  it('should still have state.isMoving === true a touch ended but there are still more touches left', () => {
    const wrapper = shallow(<Slider {...props} />);
    const instance = wrapper.instance();
    const handleOnTouchEnd = jest.spyOn(instance, 'handleOnTouchEnd');
    wrapper.setState({
      isMoving: true,
    });
    wrapper.update();
    wrapper.find('.sliderTray').simulate('touchend', touch100);
    wrapper.update();
    expect(handleOnTouchEnd).toHaveBeenCalledTimes(1);
    expect(wrapper.state('isMoving')).toBe(true);
  });
  it('should show a spinner if the carousel was just inserted in the DOM but the carousel slides are still being added', () => {
    const wrapper = shallow(<Slider {...props} hasMasterSpinner />);
    expect(wrapper.find('.masterSpinnerContainer').length).toBe(1);
    expect(wrapper.find('.carousel__master-spinner-container').length).toBe(1);
  });
  it('should call any supplied onMasterSpinner function when the masterSpinner is showing.', () => {
    const onMasterSpinner = jest.fn();
    shallow(<Slider {...props} hasMasterSpinner onMasterSpinner={onMasterSpinner} />);
    expect(onMasterSpinner).toHaveBeenCalledTimes(1);
  });
});