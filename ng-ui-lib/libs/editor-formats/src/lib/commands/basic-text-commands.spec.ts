import { BoldCommand, ItalicCommand, UnderlineCommand, StrikethroughCommand } from './basic-text-commands';
import { EditorContext } from '../interfaces/editor-context.interface';

describe('Basic Text Commands', () => {
  let mockDocument: Document;
  let mockElement: HTMLElement;
  let mockSelection: Selection;
  let mockRange: Range;
  let context: EditorContext;
  
  beforeEach(() => {
    // Create mock DOM elements
    mockDocument = document.implementation.createHTMLDocument('test');
    mockElement = mockDocument.createElement('div');
    mockElement.contentEditable = 'true';
    mockDocument.body.appendChild(mockElement);
    
    // Create mock selection and range
    mockRange = mockDocument.createRange();
    mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue(mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      toString: jest.fn().mockReturnValue('')
    } as any;
    
    context = {
      element: mockElement,
      selection: mockSelection,
      range: mockRange,
      isFocused: true,
      document: mockDocument
    };
  });
  
  describe('BoldCommand', () => {
    let command: BoldCommand;
    
    beforeEach(() => {
      command = new BoldCommand();
      command.setContext(context);
    });
    
    it('should create command with correct properties', () => {
      expect(command.id).toBe('bold');
      expect(command.name).toBe('Bold');
      expect(command.icon).toBe('format-bold');
      expect(command.shortcut).toBe('Ctrl+B');
    });
    
    it('should execute bold command', () => {
      const mockExecCommand = jest.spyOn(mockDocument, 'execCommand').mockReturnValue(true);
      const mockFocus = jest.spyOn(mockElement, 'focus');
      
      command.execute();
      
      expect(mockFocus).toHaveBeenCalled();
      expect(mockExecCommand).toHaveBeenCalledWith('bold', false, undefined);
    });
    
    it('should check active state using queryCommandState', () => {
      const mockQueryCommandState = jest.spyOn(mockDocument, 'queryCommandState').mockReturnValue(true);
      
      const isActive = command.checkActive();
      
      expect(mockQueryCommandState).toHaveBeenCalledWith('bold');
      expect(isActive).toBe(true);
    });
    
    it('should fallback to manual implementation when execCommand fails', () => {
      jest.spyOn(mockDocument, 'execCommand').mockReturnValue(false);
      mockElement.innerHTML = '<p>test text</p>';
      
      // Set up selection
      const textNode = mockElement.firstChild!.firstChild!;
      mockRange.setStart(textNode, 0);
      mockRange.setEnd(textNode, 4);
      
      command.execute();
      
      // Should have wrapped selection in span with font-weight
      const span = mockElement.querySelector('span');
      expect(span).toBeTruthy();
      expect(span?.style.fontWeight).toBe('bold');
    });
  });
  
  describe('ItalicCommand', () => {
    let command: ItalicCommand;
    
    beforeEach(() => {
      command = new ItalicCommand();
      command.setContext(context);
    });
    
    it('should create command with correct properties', () => {
      expect(command.id).toBe('italic');
      expect(command.name).toBe('Italic');
      expect(command.icon).toBe('format-italic');
      expect(command.shortcut).toBe('Ctrl+I');
    });
    
    it('should execute italic command', () => {
      const mockExecCommand = jest.spyOn(mockDocument, 'execCommand').mockReturnValue(true);
      
      command.execute();
      
      expect(mockExecCommand).toHaveBeenCalledWith('italic', false, undefined);
    });
    
    it('should check active state', () => {
      const mockQueryCommandState = jest.spyOn(mockDocument, 'queryCommandState').mockReturnValue(false);
      
      const isActive = command.checkActive();
      
      expect(mockQueryCommandState).toHaveBeenCalledWith('italic');
      expect(isActive).toBe(false);
    });
  });
  
  describe('UnderlineCommand', () => {
    let command: UnderlineCommand;
    
    beforeEach(() => {
      command = new UnderlineCommand();
      command.setContext(context);
    });
    
    it('should create command with correct properties', () => {
      expect(command.id).toBe('underline');
      expect(command.name).toBe('Underline');
      expect(command.icon).toBe('format-underlined');
      expect(command.shortcut).toBe('Ctrl+U');
    });
    
    it('should execute underline command', () => {
      const mockExecCommand = jest.spyOn(mockDocument, 'execCommand').mockReturnValue(true);
      
      command.execute();
      
      expect(mockExecCommand).toHaveBeenCalledWith('underline', false, undefined);
    });
  });
  
  describe('StrikethroughCommand', () => {
    let command: StrikethroughCommand;
    
    beforeEach(() => {
      command = new StrikethroughCommand();
      command.setContext(context);
    });
    
    it('should create command with correct properties', () => {
      expect(command.id).toBe('strikethrough');
      expect(command.name).toBe('Strikethrough');
      expect(command.icon).toBe('format-strikethrough');
      expect(command.shortcut).toBe('Ctrl+Shift+X');
    });
    
    it('should execute strikethrough command', () => {
      const mockExecCommand = jest.spyOn(mockDocument, 'execCommand').mockReturnValue(true);
      
      command.execute();
      
      expect(mockExecCommand).toHaveBeenCalledWith('strikethrough', false, undefined);
    });
    
    it('should handle collapsed selection in fallback implementation', () => {
      jest.spyOn(mockDocument, 'execCommand').mockReturnValue(false);
      mockElement.innerHTML = '<p></p>';
      
      // Set up collapsed selection
      const paragraph = mockElement.firstChild!;
      mockRange.setStart(paragraph, 0);
      mockRange.setEnd(paragraph, 0);
      mockRange.collapsed = true;
      
      command.execute();
      
      // Should have inserted span with text-decoration
      const span = mockElement.querySelector('span');
      expect(span).toBeTruthy();
      expect(span?.style.textDecoration).toBe('line-through');
    });
  });
  
  describe('Error handling', () => {
    let command: BoldCommand;
    
    beforeEach(() => {
      command = new BoldCommand();
    });
    
    it('should handle missing context gracefully', () => {
      expect(() => command.execute()).not.toThrow();
      expect(command.checkActive()).toBe(false);
      expect(command.checkEnabled()).toBe(false);
    });
    
    it('should handle execCommand exceptions', () => {
      command.setContext(context);
      jest.spyOn(mockDocument, 'execCommand').mockImplementation(() => {
        throw new Error('execCommand failed');
      });
      
      expect(() => command.execute()).not.toThrow();
    });
  });
});