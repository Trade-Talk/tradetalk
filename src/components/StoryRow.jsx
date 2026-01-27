import { Plus } from 'lucide-react'

const mockStories = [
  { id: 'add', name: 'Your Story', isAdd: true },
  { id: '1', name: 'Rajesh Kumar', hasStory: true, isViewed: false },
  { id: '2', name: 'Priya S.', hasStory: true, isViewed: false },
  { id: '3', name: 'Amit D.', hasStory: true, isViewed: true },
  { id: '4', name: 'Neha P.', hasStory: true, isViewed: false },
  { id: '5', name: 'Sanjay M.', hasStory: true, isViewed: true },
]

export default function StoryRow() {
  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="flex space-x-3 px-4 overflow-x-auto hide-scrollbar">
        {mockStories.map((story) => (
          <button
            key={story.id}
            className="flex-shrink-0 active:scale-95 transition-transform touch-manipulation"
          >
            <div className="flex flex-col items-center space-y-1.5">
              {story.isAdd ? (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-full p-0.5 ${
                  story.isViewed 
                    ? 'bg-gray-300' 
                    : 'bg-gradient-to-tr from-primary-500 via-primary-600 to-primary-700'
                }`}>
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {story.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <span className="text-xs text-gray-700 font-medium w-16 text-center truncate">
                {story.isAdd ? 'Add' : story.name.split(' ')[0]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
