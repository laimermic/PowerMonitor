//
//  currentLiveActivity.swift
//  current
//
//  Created by Michael Laimer on 01.05.24.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct currentAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct currentLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: currentAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension currentAttributes {
    fileprivate static var preview: currentAttributes {
        currentAttributes(name: "World")
    }
}

extension currentAttributes.ContentState {
    fileprivate static var smiley: currentAttributes.ContentState {
        currentAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: currentAttributes.ContentState {
         currentAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: currentAttributes.preview) {
   currentLiveActivity()
} contentStates: {
    currentAttributes.ContentState.smiley
    currentAttributes.ContentState.starEyes
}
