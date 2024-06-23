ARG NODE_VERSION=18.19.0

FROM node:${NODE_VERSION}-alpine

# Set working directory for all build stages.
WORKDIR /app

# Copy the rest of the source files into the image.
COPY .output .output
COPY data/emoji-index.json data/emoji-index.json
COPY data/group-translate.json data/group-translate.json
COPY package.json .

# Use production node environment by default.
ENV NODE_ENV production
ENV PORT 8081

# Run the application as a non-root user.
# USER node

EXPOSE 8081

# Run the application.
CMD node .output/server/index.mjs
