import { BookOpen, MessageCircleQuestionIcon } from "lucide-react";

interface Props {
    iconName: string,
    size: number
}

function setIcon(iconName: string, size: number) {
    if (iconName === 'Book') {
        return <BookOpen size={size}/>
    } else if (iconName === 'Question') {
        return <MessageCircleQuestionIcon size={size} />
    }
}

export default function Icon({ iconName, size }: Props) {
    const icon = setIcon(iconName, size)

    return icon
}
