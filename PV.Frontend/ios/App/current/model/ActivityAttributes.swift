//
//  ActivityAttributes.swift
//  currentExtension
//
//  Created by Michael Laimer on 18.06.24.
//

import ActivityKit
import SwiftUI

struct MonitorAttributes : ActivityAttributes
{
    public typealias MonitorStatus = ContentState
    struct ContentState: Codable, Hashable {
        var currentProduction: Int
        let description: String
    }
    let name: String
}
