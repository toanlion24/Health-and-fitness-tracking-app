import SwiftUI

/// 8pt spacing grid and semantic colors for the signup flow (HIG-aligned).
enum SignUpDesign {
    /// Base unit — all spacing is a multiple of 8pt.
    static let grid: CGFloat = 8

    static let space1: CGFloat = grid       // 8
    static let space2: CGFloat = grid * 2   // 16
    static let space3: CGFloat = grid * 3   // 24
    static let space4: CGFloat = grid * 4   // 32

    /// Minimum interactive dimension (HIG / accessibility).
    static let minTapTarget: CGFloat = 44

    /// Primary actions — comfortable on all phones.
    static let primaryButtonMinHeight: CGFloat = 50

    /// Text fields — at least 44pt tall for touch + readability.
    static let inputMinHeight: CGFloat = 48

    static let fieldCornerRadius: CGFloat = 12
    static let buttonCornerRadius: CGFloat = 12
    static let socialCornerRadius: CGFloat = 12

    /// Stroke width for field borders (normal / focused / error).
    static let fieldBorderWidth: CGFloat = 1
    static let fieldBorderWidthFocused: CGFloat = 2
}
